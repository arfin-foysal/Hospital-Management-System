const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');

class UserService {
  async getUsers(role) {
    const where = {};
    if (role) {
      where.role = role;
    }

    const users = await prisma.users.findMany({
      where,
      include: {
        doctors: true
      },
      orderBy: { id: 'desc' }
    });

    return users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      department: u.department,
      specialization: u.specialization,
      status: u.status,
      created_at: u.created_at,
      doctor_id: u.doctors?.id || null,
      room_no: u.doctors?.room_no || null,
      consultation_fee: u.doctors?.consultation_fee || null
    }));
  }

  async createUser(data) {
    const { name, email, password, role, phone, department, specialization, room_no, consultation_fee, available_days } = data;

    if (!name || !email || !password || !role) {
      throw { status: 400, message: 'Name, email, password, and role are required.' };
    }

    const existing = await prisma.users.findUnique({
      where: { email }
    });

    if (existing) {
      throw { status: 400, message: 'Email already exists' };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    return await prisma.$transaction(async (tx) => {
      const newUser = await tx.users.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          phone: phone || null,
          department: department || null,
          specialization: specialization || null
        }
      });

      if (role === 'doctor') {
        await tx.doctors.create({
          data: {
            user_id: newUser.id,
            name,
            department: department || 'General Medicine',
            specialization: specialization || 'Specialist',
            qualification: 'MBBS, FCPS',
            room_no: room_no || 'Room-101',
            consultation_fee: consultation_fee ? parseFloat(consultation_fee) : 500,
            available_days: available_days || 'Mon,Tue,Wed,Thu,Sat',
            phone,
            email
          }
        });
      }

      return { userId: newUser.id };
    });
  }

  async toggleStatus(id) {
    const user = await prisma.users.findUnique({
      where: { id: parseInt(id) }
    });

    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    const updated = await prisma.users.update({
      where: { id: parseInt(id) },
      data: { status: newStatus }
    });

    return { status: updated.status };
  }
}

module.exports = new UserService();

