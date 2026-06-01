/* CourseKit.quiz — build a randomized attempt from a question bank and score it */
(function (global) {
  'use strict';
  var CK = global.CourseKit || (global.CourseKit = {});
  function cfg() { return CK.config || {}; }

  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  // Clone a bank question with options shuffled; remap the correct index.
  function prepare(q) {
    var order = shuffle(q.options.map(function (_, i) { return i; }));
    return {
      id: q.id,
      question: q.question,
      code: q.code || null,
      options: order.map(function (i) { return q.options[i]; }),
      correctIndex: order.indexOf(q.correctAnswerIndex),
      explanation: q.explanation || ''
    };
  }

  // bank: array of bank questions; draws config.quizSize (or fewer if bank smaller)
  function createQuiz(bank) {
    var n = Math.min(cfg().quizSize, bank.length);
    var questions = shuffle(bank).slice(0, n).map(prepare);

    return {
      questions: questions,
      answers: new Array(questions.length).fill(null),
      index: 0,
      submitted: false,

      setAnswer: function (optIdx) { this.answers[this.index] = optIdx; },
      answeredCount: function () { return this.answers.filter(function (a) { return a != null; }).length; },
      allAnswered: function () { return this.answeredCount() === this.questions.length; },

      score: function () {
        var c = 0, self = this;
        this.questions.forEach(function (q, i) { if (self.answers[i] === q.correctIndex) c++; });
        return c;
      },
      result: function () {
        var correct = this.score(), total = this.questions.length;
        var percent = Math.round((correct / total) * 100);
        return { correct: correct, total: total, percent: percent, passed: percent >= cfg().passThreshold };
      }
    };
  }

  CK.quiz = { create: createQuiz };
})(window);
