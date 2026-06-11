const FAL_KEY = "f217998e-c4c2-443a-9636-fbb86e91cea5:f0c5fce4deac463a2bc0394393aac48c";

async function testFal() {
  const base64DataUri = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAbEAADAAMBAQAAAAAAAAAAAAABAgMABAURUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAFgEQAwAAAAAAAAAAAAAAAAAAAAAR/9oADAMBAAIRAxEAPwAkr8D/2Q=="; // tiny 1x1 image

  const response = await fetch('https://fal.run/fal-ai/flux/dev/image-to-image', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      image_url: base64DataUri,
      prompt: "A beautiful sunset",
      strength: 0.85
    })
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("FAILED:", response.status, text);
  } else {
    const data = await response.json();
    console.log("SUCCESS:", data);
  }
}
testFal();
