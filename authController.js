import pool from '../models/db.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const loginUser = async (req, res) => {
  const { email, password } = req.body
  console.log("📥 Login attempt:", email)

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    console.log("🧾 DB result:", result.rows)

    const user = result.rows[0]
    if (!user) {
      console.warn("❗ User not found")
      return res.status(401).json({ message: 'Email tidak ditemukan' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      console.warn("❗ Password salah")
      return res.status(401).json({ message: 'Password salah' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    console.log("✅ Login sukses:", user.email)

    res.json({ token, user: { id: user.id, nama: user.nama, role: user.role } })
  } catch (err) {
    console.error("❌ ERROR DETAIL:", err.message)
    console.error(err.stack)
    res.status(500).json({ message: 'Server error' })
  }
}
