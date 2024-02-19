import React, { useEffect, useState, useCallback } from "react";
import "./imageUpload.css";
import { useDropzone } from "react-dropzone";
import { uploadPost } from "../../utils/apiHelper";


const ImageUploadDrop = ({
    onUploadDone = () => { },
    onRemove = () => { },
    fileKey: propsFileKey,
    imageUrl: propsImageUrl,
    isApproved,
    disabled = false,
    uploadType: propsUploadType,
    setImage
}) => {
    const [imageUrl, setImageUrl] = useState(propsImageUrl);
    const [uploadType, setUploadType] = useState(propsUploadType);
    const [loading, setLoading] = useState(false);
    const [fileKey, setFileKey] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [fileContent, setFileContent] = useState({});

    const onDrop = useCallback((acceptedFiles) => {
        try {
            let file = acceptedFiles[0];
            if (!file) return;
            if (file) {
                const { name, type } = file;
                setFileContent({ name, type });
                const reader = new FileReader();
                reader.onload = () => {
                    // setImageUrl(reader.result);
                };
                reader.readAsDataURL(file);
                uploadToCloud(file);
            } else onError("Please select image file");
        } catch (error) {
            console.log("errror", error);
        }

    }, []);

    const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
        accept: ".png, .jpg, .jpeg",
        maxFiles: 1,
        onDrop,
    });

    const removeImage = () => {
        setImageUrl("");
        onRemove("");
        onUploadDone("");
    };

    const getUploadKeyWithBaseFolderLocation = (filename) => {
        return "uploads/" + new Date().getTime() + "/" + filename;
    };

    const uploadToCloud = async (file, haveToUpload = true) => {
        if (loading) return;

        if (!haveToUpload) {
            setImageUrl("");
            return;
        }

        try {
            const key = getUploadKeyWithBaseFolderLocation(file.name);
            const extension = file.name.split(".")[file.name.split(".").length - 1];
            setLoading(true);
            const payload = {
                key: key,
                content: file.type,
            };
            const response = await uploadPost(payload);
            if (!response) return;
            var url = response;

            const handleProgress = (evt) => {
                let p = `${evt.type}: ${evt.loaded} bytes transferred\n`;
                var progress = Math.ceil((evt.loaded / evt.total) * 100);
                setUploadProgress(progress);
            };

            setLoading(true);

            setUploadProgress(0);

            var xhr = new XMLHttpRequest();
            xhr.open("PUT", url, true);
            xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
            xhr.setRequestHeader("x-amz-acl", "public-read");
            xhr.setRequestHeader("Caches", false);
            xhr.setRequestHeader("Content-Type", file.type);
            xhr.upload.addEventListener("progress", handleProgress, false);
            xhr.onload = function () {
                setLoading(false);
                if (xhr.readyState == 4 && xhr.status == "200") {
                    let fileUrl = url.split("?")[0];
                    setImageUrl(fileUrl);
                    setImage(fileUrl)
                    onUploadDone(fileUrl);
                } else {
                    console.log(
                        "Could not upload image please try again---",
                        "asset image"
                    );
                }
            };
            xhr.onerror = function (error) {
                console.log("error", error);
                setLoading(false);
                console.log("Could not upload image please try again", "asset image");
            };
            xhr.send(file);
        } catch (error) {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    useEffect(() => {
        setImageUrl(propsImageUrl);
        setFileKey(propsFileKey);
        setUploadType(propsUploadType);
    }, [propsImageUrl, propsFileKey, propsUploadType]);

    return (
        <>
            <div style={{ marginTop: "12px" }}>
                <div
                    style={{
                        border: "2px dashed #d3d3d3",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: 'white',
                        borderRadius: '5px',
                        padding: "30px"
                    }}
                >
                    {imageUrl && !loading ? (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                flexDirection: "column",
                                alignItems: "center",
                            }}
                        >
                            <div
                                className="box text-center"
                                style={{
                                    display: "flex",
                                    justifyContent: "center",
                                    width: "150px",
                                    maxHeight: "150px",
                                    position: "relative",
                                }}
                            >
                                <button
                                    disabled={isApproved || loading || disabled}
                                    className="circular ui icon button"
                                    style={{ position: "absolute", top: "0px", right: "0px" }}
                                    onClick={() =>{
                                            removeImage()
                                    }}
                                >
                                    <i className="delete icon"></i>
                                </button>
                                <img
                                    style={{ width:'70%' }}
                                    src={imageUrl}
                                    alt="cropped"
                                />
                            </div>
                        </div>
                    ) : (
                        <div >
                            <div className="fallback">
                                <input
                                    disabled={isApproved || loading || disabled}
                                    {...getInputProps()}
                                />
                            </div>
                            <div className="dz-message needsclick"
                                 {... getRootProps({ className: "dropzone" })} style={{cursor:'pointer'}}
                            >
                                {loading ? (
                                    <div style={{ color: "#9D9D9D" }}>
                                        Uploading {uploadProgress} %
                                    </div>
                                ) : (
                                    <h5>Drop Image files here or click to upload.</h5>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default ImageUploadDrop;
