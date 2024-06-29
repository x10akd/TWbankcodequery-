import React, { useState, useEffect } from "react";
import Select from "react-select";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";


const BankSearch = () => {
  const [banks, setBanks] = useState([]);
  const [bankCode, setBankCode] = useState("");
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const navigate = useNavigate();
  const { bankCode: paramBankCode, branchCode, branchName } = useParams();

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await axios.get("http://127.0.0.1:5000/banks/");
        setBanks(
          response.data.map((bank) => ({
            value: bank.code,
            label: `${bank.code} ${bank.name}`,
          }))
        );
      } catch (error) {
        console.error("Error fetching banks:", error);
      }
    };

    fetchBanks();
  }, []);

  useEffect(() => {
    const fetchBranches = async () => {
      if (paramBankCode) {
        try {
          const response = await axios.get(
            `http://127.0.0.1:5000/${paramBankCode}/branches/`
          );
          setBranches(
            response.data.branches.map((branch) => ({
              value: branch.branch_code,
              label: branch.name,
            }))
          );
          setBankCode(paramBankCode);
        } catch (error) {
          console.error("Error fetching branches:", error);
        }
      }
    };

    fetchBranches();
  }, [paramBankCode]);

  useEffect(() => {
    const fetchBranchDetails = async () => {
      if (paramBankCode && branchCode && branchName) {
        try {
          const response = await axios.get(
            `http://127.0.0.1:5000/${paramBankCode}/${branchCode}/${encodeURIComponent(
              branchName
            )}.html`
          );
          setSelectedBranch(response.data);
        } catch (error) {
          console.error("Error fetching branch details:", error);
        }
      }
    };

    fetchBranchDetails();
  }, [paramBankCode, branchCode, branchName]);

  const handleBankSelect = async (selectedOption) => {
    const selectedBankCode = selectedOption ? selectedOption.value : "";
    setBankCode(selectedBankCode);

    if (selectedBankCode) {
      try {
        const response = await axios.get(
          `http://127.0.0.1:5000/${selectedBankCode}/branches/`
        );
        setBranches(
          response.data.branches.map((branch) => ({
            value: branch.branch_code,
            label: branch.name,
          }))
        );
        setSelectedBranch(null); // Clear previous branch selection
        // navigate(`/${selectedBankCode}`);
      } catch (error) {
        console.error("Error fetching branches:", error);
      }
    } else {
      setBranches([]);
      setSelectedBranch(null);
    }
  };

  const handleBranchSelect = async (selectedOption) => {
    const branchCode = selectedOption ? selectedOption.value : "";
    const branchName = selectedOption ? selectedOption.label : "";

    if (branchCode) {
      try {
        const response = await axios.get(
          `http://127.0.0.1:5000/${bankCode}/${branchCode}/${encodeURIComponent(
            branchName
          )}.html`
        );
        setSelectedBranch(response.data);
        navigate(
          `/${bankCode}/${branchCode}/${encodeURIComponent(branchName)}.html`
        );
      } catch (error) {
        console.error("Error fetching branch details:", error);
      }
    } else {
      setSelectedBranch(null);
    }
  };

  return (
    <div>
      <h1>台灣銀行代碼查詢</h1>
      <div>
        <label>銀行名稱</label>
        <Select
          options={banks}
          onChange={handleBankSelect}
          placeholder="請輸入關鍵字或銀行代碼..."
          isClearable
        />
      </div>

      <div>
        <label>分行名稱</label>
        <Select
          options={branches}
          onChange={handleBranchSelect}
          placeholder="請選擇分行名稱"
          isClearable
          isDisabled={!bankCode}
        />
      </div>

      {selectedBranch && (
        <div>
          <h2>{selectedBranch.name}</h2>
          <p>分行代碼：{selectedBranch.branch_code}</p>
          <p>地址：{selectedBranch.address}</p>
          <p>電話：{selectedBranch.tel}</p>
        </div>
      )}
    </div>
  );
};

export default BankSearch;
