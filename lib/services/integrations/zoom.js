export async function getZoomAccessToken() {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  const authString = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await fetch(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${authString}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to get Zoom token: ${data.error}`);
  }

  return data.access_token;
}


export async function createZoomMeeting({ start_time, service, name, email, company }) {
  const accessToken = await getZoomAccessToken();

  const meetingData = {
    topic: `${service} Meeting with ${name} | ${company}`,
    type: 2, // Scheduled meeting
    start_time: start_time,
    duration: 30, // Adjust based on end_time if needed
    timezone: 'America/New_York', // Adjust based on your needs
    settings: {
      host_video: true,
      participant_video: true,
      join_before_host: false,
      mute_upon_entry: true,
      approval_type: 2,
      audio: 'voip',
      auto_recording: 'none',
    },
  };

  const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(meetingData),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to create Zoom meeting: ${data.message}`);
  }

  return {
    meeting_id: data.id,
    join_url: data.join_url,
    start_url: data.start_url,
  };
}