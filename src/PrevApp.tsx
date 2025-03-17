// import { useState, useEffect } from "react";
// import { FrameContext } from "./components/providers/FarcasterProvider";
// import { useAccount } from "wagmi";

// const WalletInfo = ({ frameContext }: { frameContext: FrameContext }) => {
//   const [isFarcasterFrame, setIsFarcasterFrame] = useState(false);
//   const { address } = useAccount();

//   useEffect(() => {
//     if (frameContext?.user?.fid) {
//       setIsFarcasterFrame(true);
//     }
//   }, [frameContext]);

//   if (!isFarcasterFrame) {
//     return (
//       <div className="flex flex-col items-center justify-center h-screen">
//         <p>Please open this page in a Farcaster client</p>
//         <a
//           href="https://warpcast.com/~/frames/launch"
//           className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg"
//         >
//           Open in Warpcast
//         </a>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen p-8">
//       <h1 className="text-3xl font-bold mb-8">Your Farcaster Profile</h1>

//       <div className="flex items-center mb-8">
//         <img
//           src={frameContext.user.pfpUrl}
//           alt="Profile"
//           className="w-24 h-24 rounded-full mr-4"
//         />
//         <div>
//           <p className="text-xl font-semibold">FID: {frameContext.user.fid}</p>
//           <p className="text-gray-600">
//             Username: {frameContext.user.username}
//           </p>
//         </div>
//       </div>

//       <div className="w-full max-w-md p-6 bg-purple-600 rounded-lg">
//         <h2 className="text-xl font-semibold mb-4">Connected Wallet:</h2>
//         <p className="font-mono break-all">{address}</p>
//       </div>
//     </div>
//   );
// };

// export default WalletInfo;
