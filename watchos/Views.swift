import SwiftUI

struct SettingsView: View {
    @AppStorage("questionCount") private var questionCount = 48
    @AppStorage("timeMinutes") private var timeMinutes = 10
    var onClose: () -> Void
    
    var tempo: Double {
        (Double(timeMinutes) * 60.0) / Double(questionCount)
    }
    
    var body: some View {
        VStack {
            Text("Seaded")
                .font(.headline)
            
            HStack {
                Text("Kogus:")
                Spacer()
                Stepper("\(questionCount)", value: $questionCount, in: 5...100, step: 1)
            }
            
            HStack {
                Text("Aeg (m):")
                Spacer()
                Stepper("\(timeMinutes)", value: $timeMinutes, in: 1...60, step: 1)
            }
            
            Text(String(format: "Tempo: %.1fs", tempo))
                .font(.footnote)
                .foregroundColor(.cyan)
            
            Button("Valmis") {
                onClose()
            }
            .padding(.top, 4)
        }
    }
}

struct ResultView: View {
    let history: [QuestionResult]
    let totalTime: TimeInterval
    let targetCount: Int
    let onRestart: () -> Void
    let onMenu: () -> Void
    
    var body: some View {
        ScrollView {
            VStack {
                Text("Tubli!")
                    .font(.title3)
                    .foregroundColor(.green)
                
                HStack {
                    VStack {
                        Text("Aeg")
                            .font(.caption2)
                        Text(formatTime(totalTime))
                            .font(.headline)
                            .foregroundColor(.yellow)
                    }
                    Spacer()
                    VStack {
                        Text("Tehteid")
                            .font(.caption2)
                        Text("\(history.count)/\(targetCount)")
                            .font(.headline)
                    }
                }
                .padding()
                
                Button("Uuesti") { onRestart() }
                    .background(Color.green)
                    .cornerRadius(20)
                
                Button("Menüü") { onMenu() }
                    .padding(.top, 4)
            }
        }
    }
    
    func formatTime(_ time: TimeInterval) -> String {
        let m = Int(time) / 60
        let s = Int(time) % 60
        return String(format: "%d:%02d", m, s)
    }
}
