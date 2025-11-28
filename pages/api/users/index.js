import { prisma } from '../../lib/prisma'

export default async function handler(req, res) {
	if (req.method == 'GET') {
		try {
			const users = await prisma.user.findMany({
				include: { posts: true }
			})
			res.status(200).json(users)
		} catch (error) {
			res.status(500).json({ error: 'Erro ao buscar usuario' })
		} else {
			res.status(405).json({ error: 'Metodo nao permitido' })
		}
	}
}
