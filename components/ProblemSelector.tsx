// components/ProblemSelector.tsx - 最终正确版
"use client";
import { useState, useEffect } from "react";
import CoachBox from "./CoachBoxV2";
import ImageUploader from "./ImageUploader";
import SolutionViewer from "./SolutionViewer";

type Grade = 5 | 6 | 7;
type Difficulty = "easy" | "medium" | "hard";
type Topic = "any" | "arithmetic" | "fractions" | "algebra" | "equations" | "geometry" | "word";

interface Problem {
  grade: number;
  difficulty: string;
  text: string;
}

export default function ProblemSelector() {
  const [grade, setGrade] = useState<Grade>(6);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [topic, setTopic] = useState<Topic>("algebra");
  const [start, setStart] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOCR, setShowOCR] = useState(false);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [selectedProblemText, setSelectedProblemText] = useState<string | null>(null);

  // OCR处理函数
  const handleTextRecognized = (text: string) => {
    setOcrText(text);
    setSelectedProblemText(text);
    setShowOCR(false);
    setStart(true);
    setShowSolution(false);
  };

  // 当筛选条件变化时，从API获取题目
  useEffect(() => {
    const fetchProblems = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/filter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            grade,
            difficulty,
            count: 10
          })
        });

        if (!response.ok) {
          throw new Error('获取题目失败');
        }

        const data = await response.json();
        if (data.ok) {
          setProblems(data.problems);
        } else {
          throw new Error(data.message || '获取题目失败');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '未知错误');
        setProblems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [grade, difficulty]);

  // 随机选择一道题
  const getRandomProblem = () => {
    if (problems.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * problems.length);
    return problems[randomIndex];
  };

  const handleStart = () => {
    let problemText: string | null = null;

    if (ocrText) {
      problemText = ocrText;
    } else {
      const selectedProblem = getRandomProblem();
      problemText = selectedProblem?.text || null;
    }

    if (problemText) {
      setSelectedProblemText(problemText);
      setStart(true);
      setShowSolution(false);
    } else {
      setError('暂无可用题目，请调整筛选条件或上传图片');
    }
  };

  return (
    <div className="space-y-6">
      <div className="ui-card flex flex-wrap items-end gap-4">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-neutral-700 mb-1">年级</label>
          <select
            className="ui-field w-full"
            value={grade}
            onChange={(e) => setGrade(Number(e.target.value) as Grade)}
          >
            <option value={5}>五年级</option>
            <option value={6}>六年级</option>
            <option value={7}>七年级</option>
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-neutral-700 mb-1">难度</label>
          <select
            className="ui-field w-full"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
          >
            <option value="easy">简单</option>
            <option value="medium">中等</option>
            <option value="hard">挑战</option>
          </select>
        </div>

        <div className="flex-1 min-w-[180px]">
          <label className="block text-sm font-medium text-neutral-700 mb-1">知识点</label>
          <select
            className="ui-field w-full"
            value={topic}
            onChange={(e) => setTopic(e.target.value as Topic)}
          >
            <option value="any">不限</option>
            <option value="arithmetic">整数运算</option>
            <option value="fractions">分数/百分数</option>
            <option value="algebra">代数/化简</option>
            <option value="equations">方程/不等式</option>
            <option value="geometry">几何</option>
            <option value="word">应用题</option>
          </select>
        </div>

        <button
          onClick={handleStart}
          disabled={loading || problems.length === 0}
          className="ui-btn disabled:opacity-50 disabled:cursor-not-allowed"
          title={loading ? "加载中..." : "根据选择自动出题"}
        >
          {loading ? "加载中..." : "开始出题"}
        </button>
      </div>

      {/* OCR上传区域 */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowOCR(!showOCR)}
          className="ui-btn"
        >
          {showOCR ? '取消上传' : '上传题目图片'}
        </button>
        
        {ocrText && (
          <button
            onClick={() => {
              setOcrText(null);
              setSelectedProblemText(null);
              setStart(false);
            }}
            className="ui-btn"
          >
            重新选择
          </button>
        )}
      </div>

      {showOCR && (
        <div className="ui-card">
          <ImageUploader onTextRecognized={handleTextRecognized} />
        </div>
      )}

      {ocrText && (
        <div className="ui-card bg-blue-50 border-blue-200">
          <p className="text-sm text-blue-800 font-medium mb-2">识别到的题目：</p>
          <p className="text-blue-900">{ocrText}</p>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* 题目统计 */}
      {!loading && !error && !ocrText && (
        <p className="text-center text-neutral-500 text-sm">
          发现 {problems.length} 道符合条件的题目
        </p>
      )}

      <div className="pt-4">
        {start && selectedProblemText ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="ui-btn"
              >
                {showSolution ? '隐藏解答' : '显示解答'}
              </button>
            </div>
            
            <CoachBox initialUserMessage={selectedProblemText} />
            
            {showSolution && (
              <SolutionViewer problemText={selectedProblemText} />
            )}
          </div>
        ) : (
          <p className="text-center text-sm text-neutral-500 py-8">
            {loading ? "正在加载题目..." : "选择条件后点击「开始出题」，或上传题目图片"}
          </p>
        )}
      </div>
    </div>
  );
}