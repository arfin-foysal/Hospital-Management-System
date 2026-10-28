const prisma = require('../config/prisma');

class PharmacyService {
  async getMedicines({ search, category, low_stock, expiring_soon }) {
    const where = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { generic_name: { contains: search } },
        { batch_number: { contains: search } },
        { manufacturer: { contains: search } }
      ];
    }

    if (category) {
      const catMap = {
        'IV Fluid': 'IV_Fluid'
      };
      where.category = catMap[category] || category;
    }

    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);

    if (expiring_soon === 'true') {
      where.expiry_date = { lte: sixtyDaysFromNow };
    }

    const medicines = await prisma.medicines.findMany({
      where,
      orderBy: [{ stock_quantity: 'asc' }, { name: 'asc' }]
    });

    const categoryReverseMap = {
      'IV_Fluid': 'IV Fluid'
    };

    let formatted = medicines.map(m => {
      const is_low_stock = m.stock_quantity <= m.reorder_level ? 1 : 0;
      const is_expiring_soon = new Date(m.expiry_date) <= sixtyDaysFromNow ? 1 : 0;
      return {
        ...m,
        category: categoryReverseMap[m.category] || m.category,
        expiry_date: m.expiry_date.toISOString().slice(0, 10),
        is_low_stock,
        is_expiring_soon
      };
    });

    if (low_stock === 'true') {
      formatted = formatted.filter(m => m.is_low_stock === 1);
    }

    const stats = {
      totalMedicines: formatted.length,
      lowStockCount: formatted.filter(m => m.is_low_stock === 1).length,
      expiringCount: formatted.filter(m => m.is_expiring_soon === 1).length,
      totalInventoryValue: formatted.reduce((sum, m) => sum + (m.stock_quantity * parseFloat(m.unit_price)), 0)
    };

    return { stats, data: formatted };
  }

  async addMedicine(data) {
    const {
      name,
      generic_name,
      category,
      batch_number,
      manufacturer,
      unit_price,
      purchase_price = 0,
      stock_quantity,
      reorder_level = 20,
      expiry_date,
      location_rack = 'Rack-A1'
    } = data;

    if (!name || !generic_name || !category || !batch_number || !unit_price || !expiry_date) {
      throw { status: 400, message: 'All required medicine fields must be provided.' };
    }

    const catMap = {
      'IV Fluid': 'IV_Fluid'
    };

    return await prisma.medicines.create({
      data: {
        name,
        generic_name,
        category: catMap[category] || category,
        batch_number,
        manufacturer: manufacturer || 'Standard',
        unit_price: parseFloat(unit_price),
        purchase_price: parseFloat(purchase_price || 0),
        stock_quantity: parseInt(stock_quantity || 0),
        reorder_level: parseInt(reorder_level || 20),
        expiry_date: new Date(expiry_date),
        location_rack
      }
    });
  }

  async updateMedicine(id, data) {
    const { name, generic_name, category, batch_number, manufacturer, unit_price, purchase_price, stock_quantity, reorder_level, expiry_date, location_rack } = data;

    const catMap = {
      'IV Fluid': 'IV_Fluid'
    };

    return await prisma.medicines.update({
      where: { id: parseInt(id) },
      data: {
        name,
        generic_name,
        category: category ? (catMap[category] || category) : undefined,
        batch_number,
        manufacturer,
        unit_price: unit_price ? parseFloat(unit_price) : undefined,
        purchase_price: purchase_price ? parseFloat(purchase_price) : undefined,
        stock_quantity: stock_quantity !== undefined ? parseInt(stock_quantity) : undefined,
        reorder_level: reorder_level !== undefined ? parseInt(reorder_level) : undefined,
        expiry_date: expiry_date ? new Date(expiry_date) : undefined,
        location_rack
      }
    });
  }

  async dispenseMedicines(data, userId) {
    const { patient_id, patient_name, prescription_id, items = [], discount = 0 } = data;

    if (!items || items.length === 0) {
      throw { status: 400, message: 'No medicine items provided for dispensing.' };
    }

    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `PH-INV-${year}-${rand}`;

    return await prisma.$transaction(async (tx) => {
      let totalAmount = 0;

      // Validate stock and deduct
      for (const item of items) {
        const med = await tx.medicines.findUnique({
          where: { id: parseInt(item.medicine_id) }
        });

        if (!med) {
          throw { status: 404, message: `Medicine ID ${item.medicine_id} not found.` };
        }

        if (med.stock_quantity < item.quantity) {
          throw { status: 400, message: `Insufficient stock for "${med.name}". Available: ${med.stock_quantity}, Requested: ${item.quantity}` };
        }

        const itemPrice = parseFloat(item.unit_price || med.unit_price);
        totalAmount += itemPrice * item.quantity;

        await tx.medicines.update({
          where: { id: med.id },
          data: { stock_quantity: med.stock_quantity - item.quantity }
        });
      }

      const netAmount = Math.max(0, totalAmount - parseFloat(discount || 0));

      const sale = await tx.pharmacy_sales.create({
        data: {
          invoice_number: invoiceNumber,
          patient_id: patient_id ? parseInt(patient_id) : null,
          patient_name: patient_name || 'Walk-in Customer',
          prescription_id: prescription_id ? parseInt(prescription_id) : null,
          total_amount: totalAmount,
          discount: parseFloat(discount || 0),
          net_amount: netAmount,
          payment_status: 'Paid',
          dispensed_by: userId || null,
          pharmacy_sale_items: {
            create: items.map(item => ({
              medicine_id: parseInt(item.medicine_id),
              quantity: parseInt(item.quantity),
              unit_price: parseFloat(item.unit_price),
              subtotal: parseFloat(item.unit_price) * parseInt(item.quantity)
            }))
          }
        }
      });

      return {
        saleId: sale.id,
        invoiceNumber,
        totalAmount,
        netAmount
      };
    });
  }

  async getSales() {
    const sales = await prisma.pharmacy_sales.findMany({
      include: {
        users: { select: { name: true } },
        pharmacy_sale_items: {
          include: { medicines: true }
        }
      },
      orderBy: { id: 'desc' },
      take: 50
    });

    return sales.map(s => ({
      ...s,
      dispensed_by_name: s.users?.name || null,
      items: s.pharmacy_sale_items.map(psi => ({
        ...psi,
        medicine_name: psi.medicines.name,
        generic_name: psi.medicines.generic_name,
        category: psi.medicines.category
      }))
    }));
  }
}

module.exports = new PharmacyService();

