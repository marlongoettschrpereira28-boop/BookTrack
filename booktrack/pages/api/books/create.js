import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
	if (req.method === 'POST') {
		try {
			const {
				titulo,
				autor,
				isbn,
				paginas,
				genero,
				capa_url,
				descricao
			} = req.body
		}
	}
}
