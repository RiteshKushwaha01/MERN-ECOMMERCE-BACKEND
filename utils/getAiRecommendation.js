import ErrorHandler from '../middlewares/errorMiddlewares.js'

export async function getAIRecommendation(req, userPrompt, products) {
  const API_KEY = process.env.GEMINI_API_KEY
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`

  // Ensure `fetch` is available in this Node runtime. Try to dynamically import `node-fetch` as a fallback.
  let fetchFn = globalThis.fetch
  if (typeof fetchFn === 'undefined') {
    try {
      // dynamic import to avoid adding a hard dependency unless needed
      const nodeFetch = await import('node-fetch')
      fetchFn = nodeFetch.default || nodeFetch
    } catch (impErr) {
      console.error(
        'fetch is not available and node-fetch could not be imported:',
        impErr
      )
      throw new ErrorHandler(
        'Server fetch unavailable. Upgrade Node or install node-fetch.',
        500
      )
    }
  }

  try {
    const geminiPrompt = `
        Here is a list of available products:
        ${JSON.stringify(products, null, 2)}

        Based on the following user request, filter and suggest the best matching products:
        "${userPrompt}"

        Only return the matching products in JSON format.
    `

    const response = await fetchFn(URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: geminiPrompt }] }],
      }),
    })

    const data = await response.json()
    const aiResponseText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ''
    const cleanedText = aiResponseText.replace(/```json|```/g, ``).trim()

    if (!cleanedText) {
      console.warn(
        'getAIRecommendation: AI returned empty response; falling back to SQL-filtered products'
      )
      return { success: true, products }
    }

    let parsedProducts
    try {
      parsedProducts = JSON.parse(cleanedText)
    } catch (error) {
      console.warn(
        'getAIRecommendation: failed to parse AI response; falling back to SQL-filtered products',
        error
      )
      return { success: true, products }
    }
    return { success: true, products: parsedProducts }
  } catch (error) {
    console.error('getAIRecommendation error:', error)
    // If fetch/import fails or unexpected error occurs, propagate as ErrorHandler so middleware handles it
    throw new ErrorHandler('Internal server error.', 500)
  }
}
