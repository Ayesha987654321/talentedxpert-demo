const HtmlData = ({ data, className, isDark }:any) => {
    return (
      <>
        <div dangerouslySetInnerHTML={{ __html: data }} className={`${isDark ? '' : 'paragraphs'} ${className}`} />
      </>
    );
};
  
export default HtmlData;