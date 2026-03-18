import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, ChevronRight, ChevronLeft, Terminal, RotateCcw, XCircle } from 'lucide-react';
import { Task, TaskStatus } from './types';

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('neural_tasks_v2');
    return saved ? JSON.parse(saved) : [];
  });
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showBin, setShowBin] = useState(false);

  useEffect(() => {
    localStorage.setItem('neural_tasks_v2', JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const task: Task = {
      id: crypto.randomUUID(),
      title: newTaskTitle,
      status: TaskStatus.TODO,
      createdAt: Date.now(),
    };

    setTasks([...tasks, task]);
    setNewTaskTitle('');
  };

  const moveToBin = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: TaskStatus.BIN } : t));
  };

  const restoreTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: TaskStatus.TODO } : t));
  };

  const permanentlyDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const clearBin = () => {
    setTasks(tasks.filter(t => t.status !== TaskStatus.BIN));
  };

  const moveTask = (id: string, direction: 'forward' | 'backward') => {
    setTasks(tasks.map(t => {
      if (t.id !== id) return t;
      
      let nextStatus = t.status;
      if (direction === 'forward') {
        if (t.status === TaskStatus.TODO) nextStatus = TaskStatus.IN_PROGRESS;
        else if (t.status === TaskStatus.IN_PROGRESS) nextStatus = TaskStatus.DONE;
      } else {
        if (t.status === TaskStatus.DONE) nextStatus = TaskStatus.IN_PROGRESS;
        else if (t.status === TaskStatus.IN_PROGRESS) nextStatus = TaskStatus.TODO;
      }
      
      return { ...t, status: nextStatus };
    }));
  };

  const columns = [
    { title: 'TODO', status: TaskStatus.TODO, color: 'border-cyan-glitch/30' },
    { title: 'PROGRESS', status: TaskStatus.IN_PROGRESS, color: 'border-magenta-glitch/30' },
    { title: 'DONE', status: TaskStatus.DONE, color: 'border-white/20' },
  ];

  const binTasks = tasks.filter(t => t.status === TaskStatus.BIN);

  return (
    <div className="min-h-screen p-4 md:p-12 relative max-w-7xl mx-auto">
      <div className="scanline pointer-events-none" />
      
      <header className="mb-16 flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-bold tracking-widest glitch-text"
          >
            NEURAL_MATRIX
          </motion.h1>
          <p className="text-[10px] opacity-40 tracking-[0.3em]">TASK_MANAGEMENT_PROTOCOL_v2.1</p>
        </div>
        
        <button 
          onClick={() => setShowBin(!showBin)}
          className={`flex items-center gap-2 px-4 py-1 border transition-all ${showBin ? 'border-magenta-glitch text-magenta-glitch' : 'border-white/20 hover:border-cyan-glitch'}`}
        >
          <Trash2 size={14} />
          {showBin ? 'CLOSE_BIN' : `BIN [${binTasks.length}]`}
        </button>
      </header>

      <AnimatePresence mode="wait">
        {!showBin ? (
          <motion.div
            key="main"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <form onSubmit={addTask} className="mb-16 max-w-2xl">
              <div className="flex items-center border-b border-cyan-glitch/50 focus-within:border-cyan-glitch transition-colors py-2">
                <Terminal size={16} className="opacity-50 mr-3" />
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="NEW_TASK_INPUT..."
                  className="flex-1 bg-transparent border-none outline-none text-lg placeholder:opacity-20"
                />
                <button type="submit" className="opacity-50 hover:opacity-100 transition-opacity">
                  <Plus size={20} />
                </button>
              </div>
            </form>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {columns.map((col) => (
                <div key={col.status} className="flex flex-col gap-6">
                  <div className={`border-b ${col.color} pb-2 flex justify-between items-baseline`}>
                    <h2 className="text-sm tracking-[0.4em] opacity-60">{col.title}</h2>
                    <span className="text-[10px] opacity-30">{tasks.filter(t => t.status === col.status).length}</span>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    <AnimatePresence mode="popLayout">
                      {tasks
                        .filter(t => t.status === col.status)
                        .sort((a, b) => b.createdAt - a.createdAt)
                        .map((task) => (
                          <motion.div
                            key={task.id}
                            layout
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="group border border-white/5 p-4 hover:bg-white/[0.02] transition-colors relative"
                          >
                            <p className="text-sm opacity-80 group-hover:opacity-100 transition-opacity mb-4">{task.title}</p>
                            
                            <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex gap-3">
                                {col.status !== TaskStatus.TODO && (
                                  <button onClick={() => moveTask(task.id, 'backward')} className="hover:text-magenta-glitch"><ChevronLeft size={14} /></button>
                                )}
                                {col.status !== TaskStatus.DONE && (
                                  <button onClick={() => moveTask(task.id, 'forward')} className="hover:text-cyan-glitch"><ChevronRight size={14} /></button>
                                )}
                              </div>
                              <button onClick={() => moveToBin(task.id)} className="hover:text-red-500/70"><Trash2 size={14} /></button>
                            </div>
                          </motion.div>
                        ))}
                    </AnimatePresence>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="bin"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-2xl mx-auto"
          >
            <div className="flex justify-between items-center mb-8 border-b border-magenta-glitch/30 pb-4">
              <h2 className="text-xl tracking-widest text-magenta-glitch">RECYCLE_BIN</h2>
              {binTasks.length > 0 && (
                <button 
                  onClick={clearBin}
                  className="text-[10px] border border-red-500/30 px-3 py-1 hover:bg-red-500/10 transition-colors"
                >
                  PURGE_ALL
                </button>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
                {binTasks.length === 0 ? (
                  <p className="text-center opacity-20 py-12 italic">BIN_IS_EMPTY</p>
                ) : (
                  binTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="border border-white/5 p-4 flex justify-between items-center group"
                    >
                      <p className="text-sm opacity-50 line-through">{task.title}</p>
                      <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => restoreTask(task.id)} className="text-cyan-glitch/50 hover:text-cyan-glitch" title="RESTORE"><RotateCcw size={14} /></button>
                        <button onClick={() => permanentlyDeleteTask(task.id)} className="text-red-500/50 hover:text-red-500" title="PURGE"><XCircle size={14} /></button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer className="fixed bottom-8 left-0 w-full text-center text-[8px] opacity-10 tracking-[1em] pointer-events-none">
        NEURAL_MATRIX_SYSTEM_STABLE // NO_ERRORS_DETECTED
      </footer>
    </div>
  );
}

