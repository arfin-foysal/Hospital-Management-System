const prisma = require('../config/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

class AuthService {
  async login(email, password) {
    if (!email || !password) {
      throw { status: 400, message: 'Please provide email and password' };
    }

    const user = await prisma.users.findUnique({
      where: { email },
      include: {
        doctors: true,
        patients: true
      }
    });

    if (!user || user.status !== 'active') {
      throw { status: 401, message: 'Invalid credentials or inactive account' };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw { status: 401, message: 'Invalid credentials' };
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      doctor_id: user.doctors?.id || null,
      patient_id: user.patients?.id || null
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

    const { password: _, ...userWithoutPassword } = user;

    return {
      token,
      user: {
        ...userWithoutPassword,
        doctor_id: user.doctors?.id || null,
        patient_record_id: user.patients?.id || null,
        patient_code: user.patients?.patient_id || null
      }
    };
  }

  async register(userData) {
    const { name, email, password, phone, role = 'patient', age, gender, blood_group, address } = userData;

    if (!name || !email || !password) {
      throw { status: 400, message: 'Name, email, and password are required' };
    }

    const existing = await prisma.users.findUnique({
      where: { email }
    });

    if (existing) {
      throw { status: 400, message: 'Email already registered' };
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Map blood group string to prisma enum if needed
    const bloodMap = {
      'A+': 'A_POS', 'A-': 'A_NEG',
      'B+': 'B_POS', 'B-': 'B_NEG',
      'AB+': 'AB_POS', 'AB-': 'AB_NEG',
      'O+': 'O_POS', 'O-': 'O_NEG'
    };
    const mappedBlood = bloodMap[blood_group] || 'O_POS';

    return await prisma.$transaction(async (tx) => {
      const newUser = await tx.users.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          phone: phone || null,
          department: role === 'patient' ? 'Outpatient' : 'Hospital Staff'
        }
      });

      let patientRecordId = null;
      let patientCode = null;

      if (role === 'patient') {
        const year = new Date().getFullYear();
        const randomSeq = Math.floor(1000 + Math.random() * 9000);
        patientCode = `PAT-${year}-${randomSeq}`;

        const newPatient = await tx.patients.create({
          data: {
            patient_id: patientCode,
            user_id: newUser.id,
            name,
            age: parseInt(age) || 30,
            gender: gender || 'Male',
            blood_group: mappedBlood,
            phone: phone || '',
            email,
            address: address || ''
          }
        });
        patientRecordId = newPatient.id;
      }

      const tokenPayload = {
        id: newUser.id,
        email,
        role,
        name,
        doctor_id: null,
        patient_id: patientRecordId
      };

      const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

      return {
        token,
        user: {
          id: newUser.id,
          name,
          email,
          role,
          phone,
          patient_code: patientCode,
          patient_record_id: patientRecordId
        }
      };
    });
  }

  async getMe(userId) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        doctors: true,
        patients: true
      }
    });

    if (!user) {
      throw { status: 404, message: 'User not found' };
    }

    const { password: _, ...userWithoutPassword } = user;
    return {
      ...userWithoutPassword,
      doctor_id: user.doctors?.id || null,
      room_no: user.doctors?.room_no || null,
      consultation_fee: user.doctors?.consultation_fee || null,
      patient_record_id: user.patients?.id || null,
      patient_code: user.patients?.patient_id || null
    };
  }
}

module.exports = new AuthService();

