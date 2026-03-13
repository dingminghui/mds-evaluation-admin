import { Link } from "react-router";

export function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 dark:bg-slate-950">
      <h1 className="font-bold text-4xl text-slate-800 dark:text-slate-100">
        MDS 评估管理后台
      </h1>
      <p className="text-slate-600 text-lg dark:text-slate-400">
        管理 MDS 评估埋点记录
      </p>
      <div className="flex gap-3">
        <Link
          className="rounded-lg bg-sky-600 px-5 py-2.5 text-white hover:bg-sky-700 dark:bg-sky-500 dark:hover:bg-sky-600"
          to="/records"
        >
          MDS 评估记录
        </Link>
        <Link
          className="rounded-lg border border-slate-300 px-5 py-2.5 text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
          to="/about"
        >
          关于
        </Link>
      </div>
    </div>
  );
}
