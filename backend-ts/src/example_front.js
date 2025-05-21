// === React Frontend (TypeScript) ===
// File: src/components/BuyWithTransak.tsx

import React, { useEffect } from 'react';

const BuyWithTransak: React.FC<{ walletAddress: string }> = ({ walletAddress }) => {
  const loadScript = () => {
    const script = document.createElement('script');
    script.src = 'https://global.transak.com/sdk/v1.1/embed.js';
    script.async = true;
    document.body.appendChild(script);
  };

  useEffect(() => {
    loadScript();
  }, []);

  const launchTransak = () => {
    const transak = new (window as any).TransakSDK({
      apiKey: 'YOUR_TRANSAK_API_KEY',
      environment: 'STAGING', // Change to 'PRODUCTION' in live
      walletAddress,
      defaultCryptoCurrency: 'USDC',
      network: 'sui',
      fiatCurrency: 'NGN',
      themeColor: '000000',
      hostURL: window.location.origin,
      widgetHeight: '600px',
      widgetWidth: '450px',
      redirectURL: window.location.href,
    });

    transak.init();

    transak.on(transak.ALL_EVENTS, (data) => {
          console.log(data);
        }); 

    transak.on('TRANSAK_ORDER_SUCCESSFUL', (orderData: any) => {
      console.log('Order Success:', orderData);
      // Optionally notify backend of the completed order
    });
  };

  return (
    <div>
      <button onClick={launchTransak} className="bg-blue-600 text-white p-2 rounded">
        Buy USDC with Fiat
      </button>
    </div>
  );
};

export default BuyWithTransak;
