import SwiftUI

struct ContentView: View {
    @State private var gameState: GameState = .menu
    @AppStorage("questionCount") private var questionCount = 48
    @AppStorage("timeMinutes") private var timeMinutes = 10
    
    // Game Data
    @State private var history: [QuestionResult] = []
    @State private var totalElapsedTime: TimeInterval = 0
    @State private var difficulty: Int = 20
    
    enum GameState {
        case menu
        case playing
        case finished
        case settings
    }
    
    var body: some View {
        NavigationView {
            switch gameState {
            case .menu:
                MenuView(
                    startGame: { limit in
                        difficulty = limit
                        gameState = .playing
                    },
                    openSettings: {
                        gameState = .settings
                    }
                )
            case .playing:
                GameView(
                    difficulty: difficulty,
                    targetCount: questionCount,
                    targetTimeMinutes: timeMinutes,
                    onFinish: { results, time in
                        history = results
                        totalElapsedTime = time
                        gameState = .finished
                    },
                    onQuit: {
                        gameState = .menu
                    }
                )
            case .finished:
                ResultView(
                    history: history,
                    totalTime: totalElapsedTime,
                    targetCount: questionCount,
                    onRestart: {
                        gameState = .playing
                    },
                    onMenu: {
                        gameState = .menu
                    }
                )
            case .settings:
                SettingsView(onClose: {
                    gameState = .menu
                })
            }
        }
    }
}

struct MenuView: View {
    let startGame: (Int) -> Void
    let openSettings: () -> Void
    
    var body: some View {
        ScrollView {
            VStack(spacing: 8) {
                Text("Kiirarvutamine")
                    .font(.headline)
                    .foregroundColor(.green)
                
                Button(action: { startGame(10) }) {
                    Text("10 piires")
                        .font(.headline)
                        .foregroundColor(.green)
                }
                .padding(.vertical, 4)
                
                Button(action: { startGame(20) }) {
                    Text("20 piires")
                        .font(.headline)
                        .foregroundColor(.cyan)
                }
                .padding(.vertical, 4)
                
                Button(action: openSettings) {
                    Image(systemName: "gearshape.fill")
                        .foregroundColor(.gray)
                }
                .frame(height: 30)
            }
        }
        .navigationBarHidden(true)
    }
}
