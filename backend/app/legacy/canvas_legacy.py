"""
Preserved Legacy Air Canvas Python Engine.
Migrated from original repository script `canvas.py`.
Contains standalone OpenCV + MediaPipe local desktop drawing functionality.
"""

import cv2
import numpy as np

try:
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
except ImportError:
    MEDIAPIPE_AVAILABLE = False


class LegacyAirCanvasEngine:
    """Legacy Air Canvas Engine using OpenCV and MediaPipe."""

    def __init__(self, camera_id: int = 0):
        self.camera_id = camera_id
        self.colors = [
            (255, 0, 255),   # Purple
            (255, 0, 0),     # Blue
            (0, 255, 0),     # Green
            (0, 255, 255),   # Yellow
            (0, 0, 0)        # Eraser
        ]
        self.color_names = ["PURPLE", "BLUE", "GREEN", "YELLOW", "ERASER"]
        self.current_color = self.colors[0]
        self.canvas = None

    def fingers_up(self, hand):
        """Check which fingers are raised."""
        fingers = []
        fingers.append(hand.landmark[8].y < hand.landmark[6].y)    # Index finger
        fingers.append(hand.landmark[12].y < hand.landmark[10].y)  # Middle finger
        return fingers

    def draw_palette(self, img):
        """Draw top color selection bar onto frame."""
        h, w, _ = img.shape
        box_w = w // len(self.colors)
        for i, col in enumerate(self.colors):
            x1 = i * box_w
            x2 = (i + 1) * box_w
            cv2.rectangle(img, (x1, 0), (x2, 60), col, -1)
            cv2.putText(
                img, self.color_names[i], (x1 + 10, 40),
                cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2
            )

    def run_standalone(self):
        """Run standalone desktop GUI window if display is available."""
        if not MEDIAPIPE_AVAILABLE:
            print("MediaPipe not installed. Standalone mode unavailable.")
            return

        mp_hands = mp.solutions.hands
        mp_draw = mp.solutions.drawing_utils
        hands = mp_hands.Hands(
            max_num_hands=1,
            min_detection_confidence=0.6,
            min_tracking_confidence=0.6
        )

        cap = cv2.VideoCapture(self.camera_id)
        prev_x, prev_y = 0, 0

        while cap.isOpened():
            success, frame = cap.read()
            if not success:
                break

            frame = cv2.flip(frame, 1)
            h, w, _ = frame.shape

            if self.canvas is None:
                self.canvas = np.zeros((h, w, 3), dtype=np.uint8)

            self.draw_palette(frame)

            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = hands.process(rgb)

            mode = "NONE"

            if results.multi_hand_landmarks:
                for hand in results.multi_hand_landmarks:
                    mp_draw.draw_landmarks(frame, hand, mp_hands.HAND_CONNECTIONS)
                    index_up, middle_up = self.fingers_up(hand)

                    x = int(hand.landmark[8].x * w)
                    y = int(hand.landmark[8].y * h)

                    # Selection mode
                    if index_up and middle_up:
                        mode = "SELECT"
                        prev_x, prev_y = 0, 0

                        if y < 60:
                            box_w = w // len(self.colors)
                            idx = x // box_w
                            if idx < len(self.colors):
                                self.current_color = self.colors[idx]

                        cv2.circle(frame, (x, y), 15, self.current_color, cv2.FILLED)

                    # Draw / Erase mode
                    elif index_up and not middle_up:
                        mode = "DRAW"
                        cv2.circle(frame, (x, y), 10, self.current_color, cv2.FILLED)

                        if prev_x == 0 and prev_y == 0:
                            prev_x, prev_y = x, y

                        thickness = 40 if self.current_color == (0, 0, 0) else 8
                        cv2.line(self.canvas, (prev_x, prev_y), (x, y), self.current_color, thickness)
                        prev_x, prev_y = x, y

                    else:
                        prev_x, prev_y = 0, 0

            else:
                prev_x, prev_y = 0, 0

            gray = cv2.cvtColor(self.canvas, cv2.COLOR_BGR2GRAY)
            _, inv = cv2.threshold(gray, 20, 255, cv2.THRESH_BINARY_INV)
            inv = cv2.cvtColor(inv, cv2.COLOR_GRAY2BGR)
            frame = cv2.bitwise_and(frame, inv)
            frame = cv2.bitwise_or(frame, self.canvas)

            cv2.putText(
                frame, f"Mode: {mode}",
                (10, h - 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2
            )

            cv2.putText(
                frame,
                "Index: Draw | Index+Middle: Select Color | C: Clear | Q: Quit",
                (10, h - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2
            )

            try:
                cv2.imshow("FingerFlow AI - Legacy Canvas", frame)
                key = cv2.waitKey(1) & 0xFF
                if key == ord('c'):
                    self.canvas = np.zeros((h, w, 3), dtype=np.uint8)
                if key == ord('q'):
                    break
            except cv2.error:
                # Headless environment protection
                break

        cap.release()
        try:
            cv2.destroyAllWindows()
        except cv2.error:
            pass


if __name__ == "__main__":
    engine = LegacyAirCanvasEngine()
    engine.run_standalone()
