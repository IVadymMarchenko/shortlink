/**
 * Функция для конвертации SVG QR-кода в PNG и его автоматического скачивания.
 * @param {React.RefObject} qrRef - Реф на контейнер, в котором лежит SVG
 * @param {string} filename - Имя скачиваемого файла (без расширения)
 */
export const downloadQRCode = (qrRef, filename = 'cleanlink-qr') => {
  if (!qrRef.current) return;

  const svgElement = qrRef.current.querySelector('svg');
  if (!svgElement) return;

  const svgString = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const URL = window.URL || window.webkitURL || window;
  const blobURL = URL.createObjectURL(svgBlob);
  
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const context = canvas.getContext('2d');

    context.fillStyle = '#ffffff'; 
    context.fillRect(0, 0, 400, 400);
    context.drawImage(image, 0, 0, 400, 400);
    
    const png = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = png;
    downloadLink.download = `${filename}.png`;
    
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    

    URL.revokeObjectURL(blobURL);
  };
  image.src = blobURL;
};