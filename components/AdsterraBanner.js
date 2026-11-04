'use client';

export default function AdsterraBanner() {
  const adKey = '37e0ca71e4f53a5fb5dc361601e179a9';
  const width = 728;
  const height = 90;

  const iframeContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : '${adKey}',
            'format' : 'iframe',
            'height' : ${height},
            'width' : ${width},
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://bauval.org/22/${adKey}"></script>
      </body>
    </html>
  `;

  return (
    <div className="flex justify-center my-6 overflow-hidden">
      <iframe
        title="Advertisement"
        srcDoc={iframeContent}
        width={width}
        height={height}
        className="border-0 overflow-hidden"
        scrolling="no"
      />
    </div>
  );
}
