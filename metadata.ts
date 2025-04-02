type FrameEmbed = {
  version: "next";
  imageUrl: string;
  button: {
    title: string;
    action: {
      type: "launch_frame";
      name: string;
      url: string;
      splashImageUrl: string;
      splashBackgroundColor: string;
    };
  };
};

async function writeMetadata(data: FrameEmbed) {
  try {
    const jsonString = JSON.stringify(data).replace(/"/g, "&quot;");
    console.log(jsonString);
  } catch (error) {
    console.error("Error writing metadata:", error);
  }
}

const frameData: FrameEmbed = {
  version: "next",
  imageUrl:
    "https://github.com/jpfraneto/images/blob/main/fartwins.png?raw=true",
  button: {
    title: "Duplicate Yourself",
    action: {
      type: "launch_frame",
      name: "FarTwins",
      url: "https://fartwins.lat",
      splashImageUrl:
        "https://github.com/jpfraneto/images/blob/main/substance222.png?raw=true",
      splashBackgroundColor: "#68A3C1",
    },
  },
};

writeMetadata(frameData);
