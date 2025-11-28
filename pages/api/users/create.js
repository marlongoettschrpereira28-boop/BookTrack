import { prisma } from '../../../lib/prisma'

// req = request, res = response
export default async function handler(req, res) {
	if (req.method === 'POST') {
		try {
			const { nome, email } = req.body

			//cria novo usuario no banco
			const user = await prisma.user.create({
				data: {
					nome,
					email,
				}
			})

			res.status(201).json(user)
		} catch (error) {
			res.status(400).json({ error: 'Erro ao criar usuario' })
		}
	} else {
		res.status(405).json({ error: 'Metodo nao permitido' })
	}
}





