// src/utils/api.ts
export async function submitWallet(wallet: string) {
  try {
    const response = await fetch('https://ylori-quest-backend-1-ub15.onrender.com/api/submit-wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wallet }),
    })

    if (!response.ok) throw new Error('Failed to submit wallet')

    return await response.json()
  } catch (error) {
    console.error('submitWallet error:', error)
    return { success: false }
  }
}
