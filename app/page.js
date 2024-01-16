import ImageUpload from "@/components/imageUpload";

const Home = () => {
  return (
    <div className="bg-[#fcfcfc] h-screen w-full flex flex-col items-center mt-[30px]">
      <h1 className="text-3xl font-bold mb-4">Image Upscaler</h1>
      <ImageUpload />
    </div>
  );
};

export default Home;
