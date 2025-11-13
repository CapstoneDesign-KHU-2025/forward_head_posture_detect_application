// "use client";
// import React from "react";
// const postPage = async () => {
//   try {
//     const response = await fetch("/api/postures", { method: "GET" });
//     const data = await response.json();
//     console.log("Fetched posture samples:", data);
//   } catch (error) {
//     console.error("Error fetching posture samples:", error);
//   }
//   const handlebuttonClick = async () => {
//     try {
//       const response = await fetch("/api/postures", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           userId: "user_123",
//           ts: "2025-10-29T11:55:00Z",
//           angleDeg: 42.5,
//           isTurtle: true,
//           hasPose: true,
//           sessionId: 1,
//           sampleGapS: 0.8,
//         }),
//       });
//       const data = await response.json();
//       console.log("Created posture sample:", data);
//     } catch (error) {
//       console.error("Error creating posture sample:", error);
//     }
//   };

//   return (
//     <div>
//       <button onClick={handlebuttonClick}>Post</button>
//     </div>
//   );
// };
// export default postPage;
