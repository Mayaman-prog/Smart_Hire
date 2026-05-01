const pdfParse = require('pdf-parse-fork');
const mammoth = require('mammoth');

// Workaround for pdf-parse export issue (this fork exports correctly)
const pdf = typeof pdfParse === 'function' ? pdfParse : pdfParse.default;

const parsePDF = async (buffer) => {
  try {
    const data = await pdf(buffer);
    return data.text;
  } catch (error) {
    throw new Error('Failed to parse PDF: ' + error.message);
  }
};

const parseDOCX = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (error) {
    throw new Error('Failed to parse DOCX: ' + error.message);
  }
};

const extractStructuredData = (text) => {
  const data = {
    fullName: '',
    email: '',
    phone: '',
    skills: [],
    workExperience: [],
    education: []
  };

  // Email
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  if (emailMatch) data.email = emailMatch[0];

  // Phone
  const phoneMatch = text.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) data.phone = phoneMatch[0];

  // Name (first non‑email, non‑phone line with ≥2 words)
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  for (const line of lines) {
    if (!line.includes('@') && !/\d/.test(line) && line.split(' ').length >= 2) {
      data.fullName = line;
      break;
    }
  }

  // Skills
  const skillKeywords = ['JavaScript', 'React', 'Node.js', 'Python', 'Java', 'SQL', 'AWS', 'Docker', 'Git', 'CSS', 'HTML', 'TypeScript', 'Angular', 'Vue.js'];
  for (const skill of skillKeywords) {
    if (text.toLowerCase().includes(skill.toLowerCase())) {
      data.skills.push(skill);
    }
  }

  // Work experience (basic)
  const expMatch = text.match(/(?:Work Experience|Experience)([\s\S]*?)(?=(?:Education|Skills|Projects|$))/i);
  if (expMatch) {
    data.workExperience.push({ title: 'Extracted Role', company: 'Extracted Company', dates: '', description: '' });
  }

  // Education (basic)
  const eduMatch = text.match(/(?:Education|Academic Background)([\s\S]*?)(?=(?:Work Experience|Skills|Projects|$))/i);
  if (eduMatch) {
    data.education.push({ degree: 'Extracted Degree', institution: '', year: '' });
  }

  return data;
};

const parseResume = async (buffer, mimeType) => {
  let rawText = '';
  if (mimeType === 'application/pdf') {
    rawText = await parsePDF(buffer);
  } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    rawText = await parseDOCX(buffer);
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
  }
  return extractStructuredData(rawText);
};

module.exports = { parseResume };