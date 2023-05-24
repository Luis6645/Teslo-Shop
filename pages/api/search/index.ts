import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
    messege: string
}

export default function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
    res.status(404).json({ messege: 'Debe de especificar el query de búsqueda' })
}