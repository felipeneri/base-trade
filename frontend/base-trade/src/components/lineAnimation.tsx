import { useEffect, useState } from "react";
import Lottie from "lottie-react";

export const LineAnimation = () => {
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    // Carrega o arquivo JSON da pasta public
    setTimeout(() => {
      fetch("/line-purple.json")
        .then((response) => response.json())
        .then((data) => setAnimationData(data))
        .catch((error) => console.error("Erro ao carregar animação:", error));
    }, 2000);
  }, []);

  if (!animationData) {
    return null; // ou um skeleton/loading
  }

  return (
    <div className="fixed left-0 top-1/2 transform -translate-y-1/2 h-115">
      <Lottie
        animationData={animationData}
        loop={false}
        autoplay={true}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};
