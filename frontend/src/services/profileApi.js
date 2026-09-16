import api from './api';

export async function getMyProfile() {
  const res = await api.get('/profiles/me');
  return res.data;
}

export const getCandidateProfile = getMyProfile;

export async function updateMyProfile(profileData) {
  const res = await api.put('/profiles/me', profileData);
  return res.data;
}

export const updateCandidateProfile = updateMyProfile;

export async function uploadResume(formData) {
  const res = await api.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
}

export async function addSkill(skillName) {
  const res = await api.post('/profiles/me/skills', { name: skillName });
  return res.data;
}

export async function removeSkill(skillName) {
  const res = await api.delete(`/profiles/me/skills/${encodeURIComponent(skillName)}`);
  return res.data;
}

export async function getSkillSuggestions(title = '') {
  const res = await api.get('/profiles/skill-suggestions', {
    params: { title }
  });
  return res.data;
}
