export const DOCUMENT_CATEGORIES = {
  reference: { label: 'Reference', color: 'bg-purple-100 text-purple-800' },
  template: { label: 'Template', color: 'bg-orange-100 text-orange-800' },
  compliance: { label: 'Compliance', color: 'bg-red-100 text-red-800' },
  faq: { label: 'FAQ', color: 'bg-yellow-100 text-yellow-800' }
};

export const getReadableFileType = (type) => {
  const map = {
    "application/pdf": "PDF Document",
    "application/msword": "Word Document",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      "Word (DOCX)",
    "text/plain": "Plain Text",
  };
  return map[type] || type;
};