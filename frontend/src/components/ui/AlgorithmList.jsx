export function AlgorithmList({ data }) {
    return (
      <div className="algorithms-container">
        <h2>Algorithms</h2>
  
        {data?.algorithms?.length > 0 ? (
          <div className="algorithms-list">
            {data.algorithms.map((alg) => (
              <div key={alg.id} className="algorithm-card">
                <code>{alg.algorithm}</code>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-algorithms">No algorithms found.</p>
        )}
      </div>
    );
  }