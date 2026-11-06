import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload } from "lucide-react";

interface StudentResult {
  rollNo: string;
  name: string;
  marks: string;
  grade: string;
}

interface ExamBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  examClass: string;
  setExamClass: (val: string) => void;
  examType: string;
  setExamType: (val: string) => void;
  activeModalTab: "direct" | "excel";
  setActiveModalTab: (val: "direct" | "excel") => void;
  excelFile: File | null;
  setExcelFile: (file: File | null) => void;
  studentResults: StudentResult[];
  onMarksChange: (idx: number, newMarks: string) => void;
  onSave: () => void;
}

export function ExamBoardModal({
  isOpen,
  onClose,
  examClass,
  setExamClass,
  examType,
  setExamType,
  activeModalTab,
  setActiveModalTab,
  excelFile,
  setExcelFile,
  studentResults,
  onMarksChange,
  onSave
}: ExamBoardModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.3 }}
          className="bg-card border border-border/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="p-5 border-b border-border/60 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Exam Board Portal</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Upload Excel sheet or manually record exam scores</p>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full border border-border bg-card hover:bg-accent flex items-center justify-center text-muted-foreground transition cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Modal Tabs Selector */}
          <div className="flex border-b border-border/60 px-5 bg-muted/10">
            <button
              onClick={() => setActiveModalTab("direct")}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer ${
                activeModalTab === "direct"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Direct Marks Entry
            </button>
            <button
              onClick={() => setActiveModalTab("excel")}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition cursor-pointer ${
                activeModalTab === "excel"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Excel Sheet Upload
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            {/* Class / Exam Type Selectors */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Target Class</label>
                <select
                  value={examClass}
                  onChange={(e) => setExamClass(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-card px-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="10-A">Grade 10-A (Mathematics)</option>
                  <option value="10-B">Grade 10-B (Mathematics)</option>
                  <option value="9-A">Grade 9-A (Mathematics)</option>
                  <option value="9-B">Grade 9-B (Mathematics)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Exam Category</label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  className="w-full h-9 rounded-lg border border-border bg-card px-2.5 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="Mid-Term">Mid-Term Assessment</option>
                  <option value="Unit-Test-3">Unit Test 3</option>
                  <option value="Final-Prep">Final Prep Quiz</option>
                </select>
              </div>
            </div>

            {activeModalTab === "direct" ? (
              <div className="border border-border/80 rounded-xl overflow-hidden bg-card">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-muted/15 border-b border-border/80 text-[10px] font-bold text-muted-foreground uppercase">
                        <th className="p-3 w-16 text-center">Roll No</th>
                        <th className="p-3">Student Name</th>
                        <th className="p-3 w-32 text-center">Marks (out of 100)</th>
                        <th className="p-3 w-20 text-center">Grade</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {studentResults.map((student, idx) => (
                        <tr key={idx} className="hover:bg-muted/5 transition">
                          <td className="p-3 font-semibold text-center text-muted-foreground">{student.rollNo}</td>
                          <td className="p-3 font-bold text-foreground">{student.name}</td>
                          <td className="p-3 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={student.marks}
                              onChange={(e) => onMarksChange(idx, e.target.value)}
                              className="h-8 w-20 rounded-md border border-border bg-card text-center text-xs font-bold outline-none focus:border-primary"
                            />
                          </td>
                          <td className="p-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              student.grade === "A+" || student.grade === "A"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : student.grade === "B"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                : student.grade === "C"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "bg-destructive/10 text-destructive"
                            }`}>
                              {student.grade}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border/80 rounded-xl p-8 flex flex-col items-center justify-center bg-card select-none">
                  <Upload className="h-8 w-8 text-muted-foreground/60 mb-2" />
                  <p className="text-xs font-bold text-foreground">Drag & drop your class marksheet</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Supports .xlsx, .xls, .csv format up to 5MB</p>
                  
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="excel-file-uploader"
                  />
                  <label
                    htmlFor="excel-file-uploader"
                    className="mt-4 inline-flex h-8 items-center justify-center rounded-lg border border-border bg-card px-4 text-[10px] font-bold text-foreground hover:bg-accent transition cursor-pointer"
                  >
                    Select Marksheet File
                  </label>

                  {excelFile && (
                    <div className="mt-4 p-2 bg-primary/5 border border-primary/20 rounded-lg text-[10px] text-primary font-bold">
                      ✓ Selected File: {excelFile.name} ({Math.round(excelFile.size / 1024)} KB)
                    </div>
                  )}
                </div>

                <div className="p-3 bg-muted/10 border border-border/50 rounded-xl select-none">
                  <h4 className="text-xs font-bold text-foreground">Formatting Guidelines</h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                    Please construct columns labeled exactly: <strong className="text-foreground">Roll No</strong>, <strong className="text-foreground">Student Name</strong>, and <strong className="text-foreground">Marks</strong>. The spreadsheet parser will dynamically calculate student grade tiers and post updates to the live score registry.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-border/60 bg-muted/5 flex items-center justify-end gap-2.5">
            <button
              onClick={onClose}
              className="h-9 px-4 rounded-lg border border-border bg-card text-xs font-semibold text-muted-foreground hover:bg-accent transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="h-9 px-4 rounded-lg bg-primary text-xs font-bold text-primary-foreground hover:opacity-90 shadow-sm transition cursor-pointer"
            >
              Publish & Submit
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
