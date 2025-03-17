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
  imageUrl: "https://github.com/jpfraneto/images/blob/main/ankkky.png?raw=true",
  button: {
    title: "Just Write",
    action: {
      type: "launch_frame",
      name: "Anky",
      url: "https://anky.bot",
      splashImageUrl:
        "https://github.com/jpfraneto/images/blob/main/splash222.png?raw=true",
      splashBackgroundColor: "#e6ccff",
    },
  },
};

writeMetadata(frameData);
