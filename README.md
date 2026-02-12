# What The GIF

What The GIF is a web application that converts videos into GIFs.

The application downloads videos using **yt-dlp**, converts a selected portion into a GIF using **FFmpeg**, uploads the GIF to **Cloudinary**, and stores metadata in **MongoDB**.

---

## Features

- Convert YouTube videos to GIF
- Choose start time (duration 5 sec)
- Optional subtitles
- Upload GIFs to Cloudinary
- Store GIF data in MongoDB
- View created GIFs in a gallery
- Copy paste gif URL for usage


---

## Lanugages

- Node.js
- Javascript
- HTML
- CSS

---

##  NPM Packages Used

- cloudinary
- dotenv
- express
- express-rate-limit
- fluent-ffmpeg
- yt-dlp
- mongoDB
- mongoose
- multer

### Dev Dependencies

- nodemon

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/BAlmroth/what-the-GIF.git
cd what-the-GIF
npm install
```

### 2. Install Packages

```bash
npm install
```

### 3. Create .env

- Create a .env file in your root directory.
- insert base from .env.example file
- insert own credentials

## Running the Application

### Start production server

```bash
npm start
```

### Start development server
```bash
npm run dev
```

## Creators

This project was created by **Benita Almroth** (BAlmroth) and **John Ahlenhed** (johnahlenhed)

---

## Copyright & Legal Disclaimer

This project is provided for **educational and personal use only**.

Users are solely responsible for ensuring they have the appropriate rights, licenses, or permissions from the relevant copyright holders before downloading, converting, or sharing any video content.

The creators of this project do not distribute copyrighted material and do not encourage or condone copyright infringement.

By using this software, you agree to comply with all applicable copyright laws and the Terms of Service of any platform from which content is accessed, including YouTube.

Use this software at your own discretion and risk.

---

## Contact

For inquiries regarding this project:

johnahlenhed@gmail.com  
benita.almroth@hotmail.com

