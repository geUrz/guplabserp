import connection from '@/libs/db'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import sharp from 'sharp'

const uploadFolder = './public/uploads'

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true })
}

const storage = multer.memoryStorage()

const upload = multer({
  storage: storage
})

export const config = {
  api: {
    bodyParser: false,
  },
}

const handler = async (req, res) => {
  if (req.method === 'POST') {
    const uploadHandler = upload.single('file')

    uploadHandler(req, res, async (err) => {
      if (err) {
        console.error('Error al subir la imagen:', err)
        return res.status(500).json({ error: 'Error al subir la imagen', details: err.message })
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No se ha subido ningún archivo' })
      }

      try {

        const resizedImageBuffer = await sharp(req.file.buffer)
          .rotate()
          .resize(800, null)
          .jpeg({ quality: 80 })
          .toBuffer()

        // Asegurar la extensión del archivo como .jpg
        const uploadFolder = path.join(process.cwd(), 'uploads')
        const fileName = `${Date.now()}.jpg`
        const filePath = path.join(uploadFolder, fileName);
        fs.writeFileSync(filePath, resizedImageBuffer); // Escribe la imagen en disco

        const fileDbPath = `/api/uploads/${fileName}`

        const { id, imageKey } = req.body;

        if (!id || !imageKey) {
          return res.status(400).json({ error: 'ID del reporte o key de la imagen no proporcionados' })
        }

        const updateQuery = `
          UPDATE reportes
          SET ${imageKey} = ?
          WHERE id = ?;
        `
        const [result] = await connection.execute(updateQuery, [fileDbPath, id])

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Reporte no encontrada' })
        }

        return res
          .setHeader('Cache-Control', 'no-cache')
          .status(200)
          .json({ filePath: fileDbPath })
      } catch (sharpError) {
        console.error('Error al redimensionar la imagen:', sharpError)
        return res.status(500).json({ error: 'Error al procesar la imagen', details: sharpError.message })
      }
    })

  } else if (req.method === 'DELETE') {
    const { id, imageKey } = req.query;

    if (!id || !imageKey) {
      return res.status(400).json({ error: 'ID del reporte o key de la imagen no proporcionados' })
    }

    try {
      // Obtener la ruta de la imagen desde la base de datos
      const selectQuery = `
        SELECT ${imageKey} AS filePath
        FROM reportes
        WHERE id = ?;
      `;
      const [rows] = await connection.execute(selectQuery, [id])

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Reporte no encontrado' })
      }

      const { filePath } = rows[0];

      // Verificar si la ruta es válida y eliminar el archivo de la carpeta
      if (filePath) {
        const uploadFolder = path.join(process.cwd(), 'uploads');  // Asegúrate de que esta ruta sea consistente
        const fullPath = path.join(uploadFolder, path.basename(filePath));

        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
          console.log(`Archivo ${fullPath} eliminado correctamente.`);
        } else {
          console.log(`No se encontró el archivo ${fullPath}`);
        }
      }

      // Actualizar el campo en la base de datos a NULL
      const updateQuery = `
        UPDATE reportes
        SET ${imageKey} = NULL
        WHERE id = ?;
      `;
      const [result] = await connection.execute(updateQuery, [id])

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'No se pudo actualizar el reporte' })
      }

      return res.status(200).json({ message: 'Imagen eliminada correctamente' })
    } catch (error) {
      console.error('Error al eliminar la imagen:', error)
      return res.status(500).json({ error: 'Error al eliminar la imagen', details: error.message })
    }


  } else {
    res.setHeader('Allow', ['POST', 'DELETE'])
    res.status(405).end(`Método ${req.method} no permitido`)
  }
}

export default handler;
