import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // In a real app, you might want to invalidate the token on the server side
    // For now, we'll just return success and let the client handle token removal
    
    return res.status(200).json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}