import fs from 'fs';

export function removeFile(path: string) {
    fs.unlink(path, (err) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('File removed successfully');
    });
}