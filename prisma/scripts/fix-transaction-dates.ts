import prisma from '../../lib/prisma'

async function main() {
  const expenses = await prisma.expense.findMany()

  for (const exp of expenses) {
    await prisma.expense.update({
      where: { id: exp.id },
      data: {
        transactionDate: exp.createdAt,
      },
    })
  }
}

main()
  .then(() => {
    console.log('Done.')
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
