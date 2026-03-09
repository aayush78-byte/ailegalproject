
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__))))

from rule_engine import verify_clause
from risk_score import calculate_risk_score, get_risk_level
from deviation_engine import check_deviation
import json

def run_tests():
    print("=== Rule Engine & Risk Scoring Verification ===")
    
    test_cases = [
        {
            "name": "Non-compete Clause (High Risk)",
            "text": "The employee shall not compete with the company or engage in any competing business for 2 years after termination of employment. This non-compete obligation applies across India.",
            "expect_severity": "high"
        },
        {
            "name": "IP Assignment (High Risk)",
            "text": "All intellectual property, innovations, code, designs and any work product created by Employee during and after employment shall assign all rights to the Company, irrevocably and worldwide.",
            "expect_severity": "high"
        },
        {
            "name": "Unilateral Change (High Risk)",
            "text": "The Company reserves the right to modify the terms of this agreement at any time at its sole discretion without prior notice to the employee.",
            "expect_severity": "high"
        },
        {
            "name": "Foreign Jurisdiction (High Risk)",
            "text": "Any disputes arising under this agreement shall be subject to the exclusive jurisdiction of the courts of Singapore.",
            "expect_severity": "high"
        },
        {
            "name": "Clean Clause (Low Risk)",
            "text": "This agreement shall be governed by the laws of India. The parties agree to resolve any disputes through mutual consultation.",
            "expect_severity": "none"
        }
    ]
    
    for tc in test_cases:
        print(f"\nTesting: {tc['name']}")
        legal = verify_clause(tc['text'])
        dev = check_deviation(tc['text'])
        score = calculate_risk_score(legal, dev)
        level = get_risk_level(score)
        
        v_count = len(legal.get('violations', []))
        print(f"  Violations found: {v_count}")
        print(f"  Risk Score: {score}/100")
        print(f"  Risk Level: {level}")
        
        for v in legal.get('violations', []):
            print(f"  - [{v['severity'].upper()}] {v['rule_id']}: {v['law']}")
            
        if tc['expect_severity'] == 'high':
            if score < 60:
                print("  FAILED: Expected high risk score (>= 60)")
            else:
                print("  PASSED: High risk correctly detected")
        elif tc['expect_severity'] == 'none':
            if score > 30:
                print("  FAILED: Expected low risk score (<= 30)")
            else:
                print("  PASSED: Clean clause correctly identified")

if __name__ == "__main__":
    run_tests()
