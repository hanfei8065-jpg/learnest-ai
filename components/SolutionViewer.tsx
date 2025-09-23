// components/SolutionViewer.tsx
"use client";
import { useState } from 'react';

interface SolutionViewerProps {
  problemText: string;
}

interface SolutionResponse {
  ok: boolean;
  problem: string;
  solution: string;
  showSteps: boolean;
  model: string;
}

export default function SolutionViewer({ problemText }: SolutionViewerProps) {
  const [showSteps, setShowSteps] = useState(true);
  const [solution, setSolution] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSolution = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/solve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problem: problemText,
          showSteps: showSteps
        })
      });

      const data: SolutionResponse = await response.json();

      if (!response.ok || !data.ok) {
        throw new Error(data.solution || '解题失败');
      }

      setSolution(data.solution);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取解答失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <button
          onClick={getSolution}
          disabled={loading}
          className="ui-btn disabled:opacity-50"
        >
          {loading ? '解题中...' : '查看详细解答'}
        </button>
        
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showSteps}
            onChange={(e) => setShowSteps(e.target.checked)}
            className="rounded border-gray-300"
          />
          显示解题步骤
        </label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {solution && (
        <div className="ui-card bg-green-50 border-green-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-green-700 font-medium">解答</span>
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
              {showSteps ? '详细步骤' : '直接答案'}
            </span>
          </div>
          <div className="text-green-900 whitespace-pre-wrap">{solution}</div>
        </div>
      )}
    </div>
  );
}