self.onmessage = ({ data: { question } } : {data: {question: string}}) => {
  self.postMessage({
    answer: 42,
  });
};
