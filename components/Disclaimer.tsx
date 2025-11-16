
import React from 'react';

const Disclaimer: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto p-4 bg-yellow-900/20 border border-yellow-700 text-yellow-300 rounded-lg">
      <p className="font-bold text-center text-sm">AVISO IMPORTANTE</p>
      <ul className="list-disc list-inside text-xs mt-2 text-yellow-400">
        <li>Este aplicativo é uma ferramenta de treinamento e educação médica.</li>
        <li><strong>NÃO</strong> deve ser usado para diagnóstico ou tratamento de pacientes reais.</li>
        <li>As simulações não substituem a avaliação presencial, protocolos locais ou o julgamento clínico em ambiente real.</li>
      </ul>
    </div>
  );
};

export default Disclaimer;
