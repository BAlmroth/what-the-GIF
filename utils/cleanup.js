import fs from 'fs';

export const deleteFile = (filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Deleted file: ${filePath}`);
        }
        return true;
    }
    catch (error) {
        console.error(`Error deleting file ${filePath}:`, error);
        return false;
    }
};

export const cleanupTempFiles = (...filePaths) => {
    filePaths.forEach(filePath => {
        if (filePath) {
            deleteFile(filePath);
        }
    });
};