import SwiftUI

struct QuestionResult: Identifiable {
    let id = UUID()
    let question: String
    let answer: Int
    let time: TimeInterval
    let isOvertime: Bool
}

struct GameView: View {
    let difficulty: Int
    let targetCount: Int
    let targetTimeMinutes: Int
    let onFinish: ([QuestionResult], TimeInterval) -> Void
    let onQuit: () -> Void
    
    @State private var question: Question?
    @State private var input = ""
    @State private var history: [QuestionResult] = []
    
    // Timer
    @State private var startTime: Date = Date()
    @State private var questionStartTime: Date = Date()
    @State private var now: Date = Date()
    let timer = Timer.publish(every: 0.1, on: .main, in: .common).autoconnect()
    
    @State private var feedbackColor: Color = .clear
    
    var targetTimePerQuestion: Double {
        return (Double(targetTimeMinutes) * 60.0) / Double(targetCount)
    }
    
    var body: some View {
        VStack {
            // Top Bar: Progress & Time
            HStack {
                Text("\(history.count)/\(targetCount)")
                    .font(.caption2)
                    .foregroundColor(.gray)
                Spacer()
                let qAge = now.timeIntervalSince(questionStartTime)
                Text(String(format: "%.1fs", qAge))
                    .font(.caption2)
                    .foregroundColor(qAge > targetTimePerQuestion ? .red : .green)
            }
            .padding(.horizontal, 2)
            
            // Question Display
            if let q = question {
                HStack(alignment: .center, spacing: 4) {
                    Text("\(q.num1)")
                    Text(q.op)
                        .foregroundColor(.cyan)
                    Text("\(q.num2)")
                    Text("=")
                        .foregroundColor(.gray)
                    Text(input.isEmpty ? "?" : input)
                        .foregroundColor(input.isEmpty ? .gray : .primary)
                }
                .font(.system(size: 30, weight: .bold, design: .rounded))
                .padding(.vertical, 4)
                .background(feedbackColor)
                .cornerRadius(8)
            }
            
            // Keypad
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 4) {
                ForEach(1...9, id: \.self) { num in
                    Button("\(num)") { handleInput("\(num)") }
                        .buttonStyle(KeypadButtonStyle())
                }
                Button("X") { input = "" }
                    .buttonStyle(KeypadButtonStyle(color: .red))
                Button("0") { handleInput("0") }
                    .buttonStyle(KeypadButtonStyle())
                Button("Quit") { onQuit() }
                    .buttonStyle(KeypadButtonStyle(color: .gray))
            }
        }
        .onAppear(perform: startGame)
        .onReceive(timer) { inputDate in
            now = inputDate
        }
    }
    
    func startGame() {
        startTime = Date()
        generateNextQuestion()
    }
    
    func generateNextQuestion() {
        questionStartTime = Date()
        question = MathLogic.generate(limit: difficulty)
        input = ""
        feedbackColor = .clear
    }
    
    func handleInput(_ digit: String) {
        guard input.count < 2 else { return }
        let newInput = input + digit
        input = newInput
        
        guard let q = question, let val = Int(newInput) else { return }
        
        if val == q.answer {
            // Correct
            feedbackColor = .green.opacity(0.3)
            let timeTaken = Date().timeIntervalSince(questionStartTime)
            
            let result = QuestionResult(
                question: "\(q.num1) \(q.op) \(q.num2)",
                answer: q.answer,
                time: timeTaken,
                isOvertime: timeTaken > targetTimePerQuestion
            )
            history.append(result)
            
            if history.count >= targetCount {
                onFinish(history, Date().timeIntervalSince(startTime))
            } else {
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                    generateNextQuestion()
                }
            }
        } else {
            // Wrong check lengths
            let ansLen = String(q.answer).count
            if newInput.count >= ansLen {
                feedbackColor = .red.opacity(0.3)
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) {
                    input = ""
                    feedbackColor = .clear
                }
            }
        }
    }
}

struct KeypadButtonStyle: ButtonStyle {
    var color: Color = Color.white.opacity(0.2)
    
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .aspectRatio(1.5, contentMode: .fit)
            .background(color)
            .cornerRadius(8)
            .scaleEffect(configuration.isPressed ? 0.9 : 1.0)
            .font(.title3)
    }
}

struct Question {
    let num1: Int
    let num2: Int
    let op: String
    let answer: Int
}

struct MathLogic {
    static func generate(limit: Int) -> Question {
        let isPlus = Bool.random()
        let op = isPlus ? "+" : "-"
        var num1 = 0, num2 = 0
        
        if isPlus {
            num1 = Int.random(in: 1..<(limit))
            num2 = Int.random(in: 1..<(limit - num1 + 1))
        } else {
            num1 = Int.random(in: 1...limit)
            num2 = Int.random(in: 1...num1)
        }
        
        return Question(num1: num1, num2: num2, op: op, answer: isPlus ? num1 + num2 : num1 - num2)
    }
}
