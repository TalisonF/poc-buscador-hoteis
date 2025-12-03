/** biome-ignore-all lint/suspicious/noConsole: dev*/
/** biome-ignore-all lint/style/useBlockStatements: dev */
/** biome-ignore-all lint/suspicious/noExplicitAny: dev */
/** biome-ignore-all lint/suspicious/noEvolvingTypes: dev */
import { useState } from 'react';

export function Home() {
  // Estados da aplicação
  const [busca, setBusca] = useState('');
  const [resultadosSV, setResultadosSV] = useState([]);
  const [resultadosInfoTravel, setResultadosInfotravel] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  // Função para buscar na API
  const handleSearch = async (e) => {
    e.preventDefault(); // Evita o recarregamento da página

    if (!busca) return;

    setCarregando(true);
    setErro(null);
    setResultadosInfotravel([]);
    setResultadosSV([]);

    try {
      const SvResponse = await fetch(
        `https://apigw.hml.smilesviagens.com.br/locality?locality=${busca}&version=v2&searchType=All`
      );
      const infoTravelData = await handleInputInfotravel(busca);
      const svData = await SvResponse.json();

      setResultadosInfotravel(infoTravelData);
      setResultadosSV(svData);
      console.log({
        sv: svData.slice(0, 3),
        infoTravelData: infoTravelData.slice(0, 3),
      });
    } catch (error) {
      console.error(error);
      setErro('Ocorreu um erro ao buscar os dados.');
    } finally {
      setCarregando(false);
    }
  };

  const handleInputInfotravel = async (inputValue) => {
    const regionsResponse = await fetch(
      `https://reservas.smilesviagens.com.br/integra/api/regiao/pesquisar/${inputValue}/null/pt_BR`
    );
    const regionsData = await regionsResponse.json();
    const hotelsResponse = await fetch(
      `https://reservas.smilesviagens.com.br/integra/api/hotel/pesquisar/${inputValue}/0/null/null/null`
    );
    const hotelsData = await hotelsResponse.json();
    let formattedRegionsList = [];
    let formattedHotelsList = [];
    if (regionsData) {
      const type = 'place';
      formattedRegionsList = regionsData.map(
        ({ id, nmRegiao, sbRegiao, dsCoordenada }) => {
          return {
            id,
            name: nmRegiao,
            description: sbRegiao,
            type,
            lat: dsCoordenada?.coordinates?.[0] || undefined,
            lng: dsCoordenada?.coordinates?.[1] || undefined,
          };
        }
      );
    }
    if (hotelsData) {
      const type = 'hotel';
      formattedHotelsList = hotelsData.map(
        ({ id, nmHotel, nmRegiao, cdLatitude, cdLongitude }) => ({
          id,
          name: nmHotel,
          description: nmRegiao,
          type,
          lat: cdLatitude,
          lng: cdLongitude,
        })
      );
    }
    const output = [...formattedRegionsList, ...formattedHotelsList];
    return output;
  };

  // Função auxiliar para formatar valores (null vira string, booleans viram string)
  const formatValue = (value) => {
    if (value === null) return <span className="val-null">null</span>;
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return value;
  };

  return (
    <div className="container">
      <header>
        <h1>Buscador de hotéis</h1>

        <form className="search-box" onSubmit={handleSearch}>
          <input
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Digite o nome do livro..."
            type="text"
            value={busca}
          />
          <button disabled={carregando} type="submit">
            {carregando ? 'Buscando...' : 'Buscar'}
          </button>
        </form>
      </header>

      <main>
        {erro && <p className="error">{erro}</p>}

        <div className="lists-wrapper">
          <div className="list-column">
            <h2 className="list-title">Infotravel</h2>

            <div className="cards-container">
              {resultadosInfoTravel.map((item, index) => (
                <div className="data-card" key={item.id || index}>
                  {/* Object.entries pega cada par chave-valor do item */}
                  {Object.entries(item).map(([key, value]) => (
                    <div className="data-row" key={key}>
                      <span className="data-key">{key}:</span>
                      <span className="data-value">{formatValue(value)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="list-column">
            <h2 className="list-title">Smiles Viagens</h2>

            <div className="cards-container">
              {resultadosSV.map((item, index) => (
                <div className="data-card" key={item.id || index}>
                  {/* Object.entries pega cada par chave-valor do item */}
                  {Object.entries(item).map(([key, value]) => (
                    <div className="data-row" key={key}>
                      <span className="data-key">{key}:</span>
                      <span className="data-value">{formatValue(value)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
