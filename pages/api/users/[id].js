import { prisma } from '../../../lib/prisma'

export default async function handler(req, res) {
	const { id } = req.query

	if (req.method === 'GET') {
		try {
			const user = await prisma.user.findUnique({
				where: { id: parseInt(id) },
				include: { posts: true }
			})

			if (!user) {
				return res.stauts(404).json({ error: 'Usuario nao encontrado' })
				res.status(200).json(user)
			} catch (error) {
				res.status(500).json({ error: 'Erro ao buscar usuario' })
			}
		}
	}

	if (req.method === 'PUT') {
		try {
			const { nome, email } = req.body

			const user = await prisma.user.update({
				where: { id: parseInt(id) },
				data: { nome, email }
			})

			res.status(200).json(user)
		} catch (error) {
			res.status(400).json({ error: 'Erro ao atualizar usuario' })
		}
	}

	if (req.method === 'DELETE') {
		try {
			await prisma.user.delete({
				where: { id: parseInt(id) }
			})

			res.status(200).json({ message: 'Usuario deletado com sucesso' })
		} catch (error) {
			res.status(400).json({ error: 'Erro ao deletar usuario' })
		}
	}
}

