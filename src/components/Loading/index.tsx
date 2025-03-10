import style from '@/components/Loading/loading.css?inline';

const Loading = () => {
  return (
    <>
      <style>{style}</style>
      <div className="loading-box">
        <div className="loading"></div>
      </div>
    </>
  );
};

export default Loading;
