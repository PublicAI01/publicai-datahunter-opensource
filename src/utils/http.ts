import ky from 'ky';
import browser from 'webextension-polyfill';

class AppError extends Error {
  constructor(
    message: string,
    public code?: number,
  ) {
    super(message);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

const network = ky.create({
  prefixUrl: import.meta.env.VITE_APP_BASE_URL,
  timeout: 5 * 60 * 1000,
  retry: 0,
  hooks: {
    beforeRequest: [
      async (request) => {
        if (!request.headers.get('Authorization')) {
          const { access } = await browser.storage.local.get('access');
          if (access) {
            request.headers.set('Authorization', `Bearer ${access as string}`);
          }
        }

        return request;
      },
    ],
    afterResponse: [
      async (_, __, response) => {
        if (response.status === 401) {
          await browser.storage.local.remove(['access', 'refresh']);
        }
        return response;
      },
      async (_, __, response) => {
        const data = await response.json<{
          code: number;
          data: { data: unknown };
          msg?: string;
        }>();

        if (data.code !== 200) {
          throw new AppError(data.msg ?? 'failed', data.code);
        }
        return new Response(JSON.stringify({ msg: data.msg, ...data.data }), {
          status: 200,
        });
      },
    ],
  },
});

export default network;
export { AppError };
