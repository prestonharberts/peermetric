// sample-data.js (now loads live data)

export async function loadInitialData() {
  try {
    const [userRes, coursesRes, groupsRes, reviewSpecsRes, studentsRes, responsesRes] = await Promise.all([
      fetch('http://localhost:1025/user', { credentials: 'include' }),
      fetch('http://localhost:1025/coursecourseId', { credentials: 'include' }),
      fetch('http://localhost:1025/group/groupId', { credentials: 'include' }),
      fetch('http://localhost:1025/reviewSpecs', { credentials: 'include' }),
      fetch('http://localhost:1025/students', { credentials: 'include' }),
      fetch('http://localhost:1025/responses', { credentials: 'include' }),
    ]);

    if (!userRes.ok) throw new Error('Failed to load user session');

    const user = await userRes.json();
    const courses = await coursesRes.json();
    const groups = await groupsRes.json();
    const reviewSpecs = await reviewSpecsRes.json();
    const students = await studentsRes.json();
    const responses = await responsesRes.json();

    return {
      user,
      courses,
      groups,
      reviewSpecs,
      students,
      responses
    };
  } catch (error) {
    console.error('Failed to load data:', error);
    return null;
  }
}