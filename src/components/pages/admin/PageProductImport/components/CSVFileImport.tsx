import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import axios from "../../../../../utils/axiosConfig";

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({
  url,
  title,
}: Readonly<CSVFileImportProps>) {
  const [file, setFile] = React.useState<File>();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(undefined);
  };

  const uploadFile = async () => {
    if (!file) {
      console.error("File is not defined!");
      return;
    }

    // Retrieve the authorization token from localStorage
    const authorizationToken = localStorage.getItem("authorization_token");

    if (!authorizationToken) {
      console.error("Authorization token is not available!");
      return;
    }

    console.log("...getting signed URL from:", url);

    try {
      // Get the presigned URL
      const response = await axios({
        method: "GET",
        url,
        params: {
          name: encodeURIComponent(file.name),
        },
        headers: {
          Authorization: `Basic ${authorizationToken}`,
        },
      });

      const { signedUrl } = response.data;

      console.log("File to upload: ", file.name);
      console.log("Uploading to: ", signedUrl);

      const result = await axios.put(signedUrl, file, {
        headers: {
          "Content-Type": file.type,
        },
      });

      console.log("Result: ", result);
      setFile(undefined);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <input type="file" onChange={onFileChange} />
      ) : (
        <div>
          <span>{file.name} </span>
          <button onClick={removeFile}>Remove file</button>
          <span> </span>
          <button onClick={uploadFile}>Upload file</button>
        </div>
      )}
    </Box>
  );
}
