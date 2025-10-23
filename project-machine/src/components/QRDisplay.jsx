import {QRCodeSVG}  from "qrcode.react";

export default function QRDisplay({ machineId }) {
  const url = `http://localhost:5000/machine/connect/${machineId}`;
  return (
    <div className="flex flex-col items-center gap-3">
      <QRCodeSVG value={url} size={220} />
      <p className="text-lg font-semibold">Scan to Connect</p>
      <p className="text-gray-500">Machine ID: {machineId}</p>
    </div>
  );
}
