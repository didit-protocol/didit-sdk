import axios, { isAxiosError } from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { code, wallet_signature } = await req.body;

    const auth = Buffer.from(
      `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
    ).toString('base64');

    const headers = {
      Authorization: `Basic ${auth}`,
    };

    const data = {
      code: code,
      grant_type: 'connect_wallet',
      wallet_signature,
    };

    try {
      const token_response = await axios.post(
        process.env.API_URL + 'token/',
        data,
        { headers }
      );
      res.status(token_response.status).json(token_response.data);
    } catch (error) {
      if (isAxiosError(error)) {
        const errorData = error.response?.data || { message: error.message };
        res.status(error.response?.status || 500).json({ message: errorData });
      } else {
        res.status(500).json({ message: error });
      }
    }
  } else {
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
};

export default handler;
